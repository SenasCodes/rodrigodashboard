import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "../lib/app-context";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    } else {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  return null;
}
