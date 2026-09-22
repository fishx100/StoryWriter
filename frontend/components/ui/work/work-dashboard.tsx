"use client";

import { useEffect, useState } from "react";

import { fetchJson } from "@/lib/api";
import { DashboardHeader } from "../dashboard/dashboard-header";
import { WorklistSection } from "../dashboard/worklist-section";
import { Work } from "@/types/work";
import { InlineMessage } from "../common/inline-message";
import { CreateWorkModal } from "@/components/modals/create-work-modal";
import { useModal } from "@/components/modals/modal-provider";

type WorkDashboardProps = {};

export function WorkDashboard({}: WorkDashboardProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    let active = true;

    async function loadWorks() {
      try {
        const data = await fetchJson<Work[]>("/api/works");
        if (active) {
          setWorks(data);
        }
      } catch {
        if (active) {
          setError("Unable to load works right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWorks();

    return () => {
      active = false;
    };
  }, []);

  const totalWorks = works.length;

  function openCreateWorkModal() {
    openModal(
      <CreateWorkModal
        onClose={closeModal}
        onWorkCreated={(work) => setWorks((current) => [...current, work])}
      />,
    );
  }

  return (
    <main className="sw-page-shell">
      <div className="sw-dashboard">
        <DashboardHeader
          totalWorks={loading || error ? null : totalWorks}
          onCreateWork={openCreateWorkModal}
        />
        <div className="sw-dashboard-content">
          {loading ? (
            <div role="status"><InlineMessage type="info" message="Loading works..." /></div>
          ) : error ? (
            <div role="alert"><InlineMessage type="error" message={error} /></div>
          ) : (
            <WorklistSection works={works} setWorks={setWorks} />
          )}
        </div>
      </div>
    </main>
  );
}
