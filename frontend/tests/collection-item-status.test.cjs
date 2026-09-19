const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');

// Exercise the actual component's save queue with controlled hooks and requests.
function harness() {
  const slots = [];
  let cursor = 0;
  let autoSave;
  const requests = [];
  const saved = [];
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => { slots[index] = value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useCallback: (callback) => callback,
    useEffect: () => {},
  };
  const source = fs.readFileSync(path.join(__dirname, '../components/ui/layout/collection-item-section.tsx'), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx: element, jsxs: element };
      if (name.endsWith('/useAutoSave')) return { useAutoSave: (_key, item, save) => { autoSave = () => save(item); } };
      if (name.endsWith('/collections/api')) return {
        updateCollectionItem: (_id, item) => new Promise((resolve, reject) => requests.push({ item, resolve, reject })),
      };
      if (name.endsWith('/status-badge')) return { default: 'StatusBadge' };
      if (name.endsWith('/collection-item-form')) return { CollectionItemForm: 'CollectionItemForm' };
      if (name.endsWith('/section-panel')) return { SectionPanel: 'SectionPanel' };
      throw new Error(name);
    },
  });
  function element(type, props) { return { type, props }; }
  function find(node, type) {
    if (!node || typeof node !== 'object') return;
    if (node.type === type) return node;
    for (const child of [node.props?.children].flat(Infinity)) {
      const found = find(child, type);
      if (found) return found;
    }
  }
  const item = { id: 'item', name: 'Ada', description: '', status_tag_id: 'todo', fields: [] };
  return {
    requests, saved,
    render() {
      cursor = 0;
      const tree = exports.CollectionItemSection({
        item, collectionId: 'collection', onSaved: (value) => saved.push(value), onBack: () => {}, backLabel: 'Back',
      });
      return {
        status: find(tree, 'StatusBadge').props,
        form: find(tree, 'CollectionItemForm').props,
        retry: () => find(tree, 'SectionPanel').props.children.at(-1).props.onClick(),
      };
    },
    autoSave: () => autoSave(),
  };
}

const tick = () => new Promise((resolve) => setImmediate(resolve));

test('status saves immediately and queued content edits retain the chosen status', async () => {
  const h = harness();
  let view = h.render();
  view.form.onChange({ ...view.form.item, description: 'Pending content' });
  view = h.render();
  view.status.onChange('done');
  await tick();
  assert.equal(h.requests[0].item.description, 'Pending content');
  assert.equal(h.requests[0].item.status_tag_id, 'done');
  view = h.render();
  view.form.onChange({ ...view.form.item, description: 'Latest content' });
  h.render();
  const pending = h.autoSave();
  assert.equal(h.requests.length, 1);
  h.requests[0].resolve(h.requests[0].item);
  await tick();
  assert.equal(h.requests[1].item.description, 'Latest content');
  assert.equal(h.requests[1].item.status_tag_id, 'done');
  h.requests[1].resolve(h.requests[1].item);
  await pending;
  assert.equal(h.saved.at(-1).description, 'Latest content');
  assert.equal(h.saved.at(-1).status_tag_id, 'done');
});

test('failed status saves retry the latest draft', async () => {
  const h = harness();
  h.render().status.onChange('done');
  await tick();
  h.requests[0].reject(new Error('offline'));
  await tick();
  h.render().retry();
  await tick();
  assert.equal(h.requests[1].item.status_tag_id, 'done');
  h.requests[1].resolve(h.requests[1].item);
  await tick();
  assert.equal(h.saved.at(-1).status_tag_id, 'done');
});
