"use client";

import React, { useState } from "react";
import { tenantsApi } from "../utils/api-client";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: "free" | "pro";
  tenantId: string;
  onSuccess: () => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  currentPlan,
  tenantId,
  onSuccess,
}: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isUpgrade = currentPlan === "free";
  const action = isUpgrade ? "upgrade" : "downgrade";

  const handleSubscriptionChange = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = isUpgrade
        ? await tenantsApi.upgradeToPro(tenantId)
        : await tenantsApi.downgradeToFree(tenantId);

      if (response.success) {
        // Update the tenant subscription status in localStorage
        // Store subscription data as JSON with tenant IDs as keys
        let tenantSubscriptions: Record<string, string> = {};
        const storedSubscriptions = localStorage.getItem("tenantSubscriptions");

        if (storedSubscriptions) {
          tenantSubscriptions = JSON.parse(storedSubscriptions);
        }

        // Update the current tenant's subscription plan
        tenantSubscriptions[tenantId] = isUpgrade ? "pro" : "free";

        // Save back to localStorage
        localStorage.setItem(
          "tenantSubscriptions",
          JSON.stringify(tenantSubscriptions)
        );
        const user = localStorage.getItem("user");
        user &&
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...JSON.parse(user),
              subscription_plan: isUpgrade ? "pro" : "free",
            })
          );
        onSuccess();
        onClose();
        window.location.reload(); // Reload to reflect changes
      } else {
        setError(
          response.message || `Failed to ${action} plan. Please try again.`
        );
      }
    } catch (err) {
      console.error(`Error ${action}ing plan:`, err);
      setError(`An error occurred while ${action}ing. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white/90 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold mb-4">
          {isUpgrade ? "Upgrade to Pro Plan" : "Downgrade to Free Plan"}
        </h3>

        <div className="mb-6">
          {isUpgrade ? (
            <div className="text-gray-700">
              <p>
                You're about to upgrade to the Pro Plan with unlimited notes.
              </p>
              <p className="mt-4">
                <span className="font-medium">Pro Plan Benefits:</span>
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Unlimited notes for your organization</li>
                <li>No restrictions on content</li>
                <li>Full feature access</li>
              </ul>
            </div>
          ) : (
            <div className="text-gray-700">
              <p>You're about to downgrade to the Free Plan.</p>
              <p className="mt-4">
                <span className="font-medium text-yellow-600">Warning:</span>
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-yellow-600">
                <li>You will be limited to 3 notes maximum</li>
                <li>
                  If you currently have more than 3 notes, you'll need to delete
                  some before using the app
                </li>
              </ul>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubscriptionChange}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-md transition-colors focus:outline-none focus:ring-2 cursor-pointer ${
              isUpgrade
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-300"
                : "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-300"
            } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isUpgrade ? "Upgrading..." : "Downgrading..."}
              </div>
            ) : isUpgrade ? (
              "Upgrade to Pro"
            ) : (
              "Downgrade to Free"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
