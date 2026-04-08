"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function SentryExamplePage() {
  useEffect(() => {
    // Pre-capture context for better error tracking
    Sentry.setContext("test_page", {
      page: "sentry-example-page",
      purpose: "testing",
    });
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        maxWidth: "600px",
        textAlign: "center",
      }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "#503B64" }}>
          🔍 Sentry Test Page
        </h1>
        
        <p style={{ color: "#666", marginBottom: "2rem", lineHeight: "1.6" }}>
          Cette page permet de tester l'intégration Sentry.
          Cliquez sur un bouton ci-dessous pour déclencher une erreur test.
        </p>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2rem",
        }}>
          {/* Client-side Error */}
          <button
            onClick={() => {
              throw new Error("✅ Sentry Client Error Test - This is intentional!");
            }}
            style={{
              padding: "1rem 2rem",
              backgroundColor: "#503B64",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            🖥️ Test Client-Side Error
          </button>

          {/* Server-side Error */}
          <button
            onClick={async () => {
              const response = await fetch("/api/sentry-example-api");
              if (!response.ok) {
                console.error("Server error test triggered");
              }
            }}
            style={{
              padding: "1rem 2rem",
              backgroundColor: "#2E7D32",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            ⚙️ Test Server-Side Error
          </button>

          {/* Undefined Function */}
          <button
            onClick={() => {
              // @ts-ignore - intentional error
              myUndefinedFunction();
            }}
            style={{
              padding: "1rem 2rem",
              backgroundColor: "#D32F2F",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            ⚠️ Test Undefined Function
          </button>
        </div>

        <div style={{
          padding: "1.5rem",
          backgroundColor: "#F3EFEA",
          borderRadius: "0.5rem",
          marginTop: "2rem",
        }}>
          <h3 style={{ marginBottom: "0.5rem", color: "#503B64" }}>
            📊 Vérification
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
            Après avoir cliqué, vérifiez le dashboard Sentry :<br />
            <a 
              href="https://sentry.io/organizations/alf-boutique/projects/sentry-sky-leaf/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#503B64", textDecoration: "underline" }}
            >
              sentry.io → Issues
            </a>
          </p>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <a 
            href="/"
            style={{
              color: "#503B64",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
