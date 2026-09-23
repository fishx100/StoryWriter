const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const element = (type, props) => ({ type, props });

function loadComponent(file, dependencies) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    require(name) {
      if (name === 'react/jsx-runtime') return { jsx: element, jsxs: element, Fragment: 'Fragment' };
      if (name in dependencies) return dependencies[name];
      throw new Error(name);
    },
  });
  return exports;
}

function descendants(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...[node.props?.children].flat(Infinity).flatMap(descendants)];
}

function listHarness() {
  const slots = [];
  let cursor = 0;
  const orders = [];
  const { DraggableList } = loadComponent('components/lists/draggable-list.tsx', {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
        return [slots[index], value => { slots[index] = value; }];
      },
      useEffect: () => {},
      useMemo: fn => fn(),
    },
  });
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  return {
    orders,
    render(overrides = {}) {
      cursor = 0;
      return DraggableList({
        items,
        getId: item => item.id,
        onReorder: async order => { orders.push(Array.from(order)); },
        customItem: (item, index) => ({ id: item.id, position: index + 1 }),
        ...overrides,
      }).props.children;
    },
  };
}

test('custom rows reorder by stable ID and display the updated positions', () => {
  const h = listHarness();
  h.render()[0].props.onDragStart();
  h.render()[2].props.onDrop();
  assert.deepEqual(h.orders, [['b', 'c', 'a']]);
  const rows = h.render();
  assert.deepEqual(Array.from(rows, row => row.props.children), [
    { id: 'b', position: 1 }, { id: 'c', position: 2 }, { id: 'a', position: 3 },
  ]);
  assert.ok(rows.every(row => row.props.className === undefined));
});

test('dropping on the same row or cancelling a drag does not reorder', () => {
  const h = listHarness();
  h.render()[0].props.onDragStart();
  h.render()[0].props.onDrop();
  assert.equal(h.orders.length, 0);
  h.render()[0].props.onDragEnd();
  h.render()[2].props.onDrop();
  assert.equal(h.orders.length, 0);
});

test('without customItem, default row controls still select and delete the correct item', () => {
  for (const customItem of [undefined, null]) {
    const h = listHarness();
    const selected = [];
    const deleted = [];
    const rows = h.render({
      customItem,
      onSelectItem: item => selected.push(item.id),
      onRequestDelete: id => deleted.push(id),
    });
    const buttons = descendants(rows[1]).filter(node => node.type === 'button');
    assert.equal(rows[1].props.className, 'sw-draggable-list-item');
    buttons[0].props.onClick();
    buttons[1].props.onClick();
    assert.deepEqual(selected, ['b']);
    assert.deepEqual(deleted, ['b']);
  }
});

test('collection rows open the selected item and request deletion of that item', () => {
  const { CollectionItemList } = loadComponent('components/lists/collection-item-list.tsx', {
    './draggable-list': { DraggableList: 'DraggableList' },
    '@/components/ui/common/icon': { Icon: 'Icon' },
    '@/components/ui/common/status-badge': { default: 'StatusBadge' },
  });
  const item = { id: 'scene', name: 'Opening', description: '', status_tag_id: 'todo' };
  const selected = [];
  const deleted = [];
  const view = CollectionItemList({
    items: [item],
    onSelectItem: value => selected.push(value),
    onRequestDelete: value => deleted.push(value),
    onReorder: async () => {},
  });
  const list = descendants(view).find(node => node.type === 'DraggableList');
  const row = list.props.customItem(item, 0);
  const nodes = descendants(row.type(row.props));
  const buttons = nodes.filter(node => node.type === 'button');
  buttons[0].props.onClick();
  buttons[1].props.onClick();
  assert.deepEqual(selected, [item]);
  assert.deepEqual(deleted, [item]);
  assert.equal(nodes.find(node => node.type === 'StatusBadge').props.currentStatusTagId, 'todo');
  assert.ok(nodes.some(node => node.props?.children === 'No summary yet.'));
});
