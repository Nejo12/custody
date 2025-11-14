"use client";

/**
 * Planning Interview Form Component
 * Multi-step form to collect user situation for personalized checklist generation
 */

import { useState } from "react";
import { useI18n } from "@/i18n";
import type { UserSituation } from "@/types/planning";

interface InterviewFormProps {
  onComplete: (situation: UserSituation) => void;
}

/**
 * Multi-step interview form for planning feature
 */
export default function InterviewForm({ onComplete }: InterviewFormProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [situation, setSituation] = useState<Partial<UserSituation>>({
    relationshipStatus: undefined,
    pregnancyStage: undefined,
    childAge: undefined,
    hasPaternityCertificate: false,
    hasJointCustody: false,
    relationshipStable: true,
    city: undefined,
  });

  /**
   * Total number of steps in the interview
   */
  const totalSteps = 7;

  /**
   * Update situation state
   */
  const updateSituation = (updates: Partial<UserSituation>): void => {
    setSituation((prev) => ({ ...prev, ...updates }));
  };

  /**
   * Handle next step
   */
  const handleNext = (): void => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Complete the interview
      if (isValidSituation()) {
        onComplete(situation as UserSituation);
      }
    }
  };

  /**
   * Handle previous step
   */
  const handlePrevious = (): void => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  /**
   * Check if current step is valid
   */
  const isCurrentStepValid = (): boolean => {
    switch (step) {
      case 0:
        return situation.relationshipStatus !== undefined;
      case 1:
        // Pregnancy stage or child age (at least one should be set)
        return situation.pregnancyStage !== undefined || situation.childAge !== undefined;
      case 2:
        // If unmarried, paternity question is relevant
        if (situation.relationshipStatus === "married") {
          return true; // Skip this step for married couples
        }
        return true; // Boolean is always valid
      case 3:
        // If unmarried, joint custody question is relevant
        if (situation.relationshipStatus === "married") {
          return true; // Skip this step for married couples
        }
        return true; // Boolean is always valid
      case 4:
        return true; // Boolean is always valid
      case 5:
        return true; // City is optional
      case 6:
        return true; // Review step
      default:
        return false;
    }
  };

  /**
   * Check if entire situation is valid
   */
  const isValidSituation = (): boolean => {
    return (
      situation.relationshipStatus !== undefined &&
      (situation.pregnancyStage !== undefined || situation.childAge !== undefined)
    );
  };

  /**
   * Calculate progress percentage
   */
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  /**
   * Render step 0: Relationship status
   */
  const renderRelationshipStatus = () => {
    const options = [
      {
        value: "married",
        label: t.planning.personalizedTool.questions.relationshipStatus.options.married,
      },
      {
        value: "unmarried",
        label: t.planning.personalizedTool.questions.relationshipStatus.options.unmarried,
      },
      {
        value: "separated",
        label: t.planning.personalizedTool.questions.relationshipStatus.options.separated,
      },
      {
        value: "other",
        label: t.planning.personalizedTool.questions.relationshipStatus.options.other,
      },
    ];

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">
          {t.planning.personalizedTool.questions.relationshipStatus.label}
        </h2>
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                updateSituation({
                  relationshipStatus: option.value as UserSituation["relationshipStatus"],
                });
                // Auto-advance after selection
                setTimeout(() => handleNext(), 300);
              }}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                situation.relationshipStatus === option.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render step 1: Pregnancy stage or child age
   */
  const renderPregnancyOrChildAge = () => {
    const pregnancyOptions = [
      {
        value: "planning",
        label: t.planning.personalizedTool.questions.pregnancyStage.options.planning,
      },
      {
        value: "first-trimester",
        label: t.planning.personalizedTool.questions.pregnancyStage.options.firstTrimester,
      },
      {
        value: "second-trimester",
        label: t.planning.personalizedTool.questions.pregnancyStage.options.secondTrimester,
      },
      {
        value: "third-trimester",
        label: t.planning.personalizedTool.questions.pregnancyStage.options.thirdTrimester,
      },
      {
        value: "postpartum",
        label: t.planning.personalizedTool.questions.pregnancyStage.options.postpartum,
      },
    ];

    const childAgeOptions = [
      {
        value: "not-born",
        label: t.planning.personalizedTool.questions.childAge.options.notBorn,
      },
      {
        value: "0-3-months",
        label: t.planning.personalizedTool.questions.childAge.options.zeroToThree,
      },
      {
        value: "3-6-months",
        label: t.planning.personalizedTool.questions.childAge.options.threeToSix,
      },
      {
        value: "6-12-months",
        label: t.planning.personalizedTool.questions.childAge.options.sixToTwelve,
      },
      {
        value: "1-2-years",
        label: t.planning.personalizedTool.questions.childAge.options.oneToTwo,
      },
      {
        value: "older",
        label: t.planning.personalizedTool.questions.childAge.options.older,
      },
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">
          {situation.pregnancyStage !== undefined
            ? t.planning.personalizedTool.questions.pregnancyStage.label
            : t.planning.personalizedTool.questions.childAge.label}
        </h2>

        {/* Pregnancy stage options */}
        {situation.pregnancyStage === undefined && situation.childAge === undefined && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t.planning.personalizedTool.questions.pregnancyStage.label}
              </h3>
              <div className="space-y-2">
                {pregnancyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      updateSituation({
                        pregnancyStage: option.value as UserSituation["pregnancyStage"],
                        childAge: undefined,
                      });
                      setTimeout(() => handleNext(), 300);
                    }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      situation.pregnancyStage === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">
                {t.planning.personalizedTool.questions.childAge.label}
              </h3>
              <div className="space-y-2">
                {childAgeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      updateSituation({
                        childAge: option.value as UserSituation["childAge"],
                        pregnancyStage: undefined,
                      });
                      setTimeout(() => handleNext(), 300);
                    }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      situation.childAge === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render step 2: Paternity certificate (only for unmarried)
   */
  const renderPaternityCertificate = () => {
    if (situation.relationshipStatus === "married") {
      // Skip this step for married couples
      return null;
    }

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">
          {t.planning.personalizedTool.questions.hasPaternityCertificate.label}
        </h2>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              updateSituation({ hasPaternityCertificate: true });
              setTimeout(() => handleNext(), 300);
            }}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              situation.hasPaternityCertificate === true
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {t.common.yes}
          </button>
          <button
            type="button"
            onClick={() => {
              updateSituation({ hasPaternityCertificate: false });
              setTimeout(() => handleNext(), 300);
            }}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              situation.hasPaternityCertificate === false
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {t.common.no}
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render step 3: Joint custody (only for unmarried)
   */
  const renderJointCustody = () => {
    if (situation.relationshipStatus === "married") {
      // Skip this step for married couples
      return null;
    }

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">
          {t.planning.personalizedTool.questions.hasJointCustody.label}
        </h2>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              updateSituation({ hasJointCustody: true });
              setTimeout(() => handleNext(), 300);
            }}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              situation.hasJointCustody === true
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {t.common.yes}
          </button>
          <button
            type="button"
            onClick={() => {
              updateSituation({ hasJointCustody: false });
              setTimeout(() => handleNext(), 300);
            }}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              situation.hasJointCustody === false
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {t.common.no}
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render step 4: Relationship stability
   */
  const renderRelationshipStable = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-2">
          {t.planning.personalizedTool.questions.relationshipStable.label}
        </h2>
        {t.planning.personalizedTool.questions.relationshipStable.help && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t.planning.personalizedTool.questions.relationshipStable.help}
          </p>
        )}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              updateSituation({ relationshipStable: true });
              setTimeout(() => handleNext(), 300);
            }}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              situation.relationshipStable === true
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {t.common.yes}
          </button>
          <button
            type="button"
            onClick={() => {
              updateSituation({ relationshipStable: false });
              setTimeout(() => handleNext(), 300);
            }}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              situation.relationshipStable === false
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {t.common.no}
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render step 5: City (optional)
   */
  const renderCity = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-2">
          {t.planning.personalizedTool.questions.city.label}
        </h2>
        {t.planning.personalizedTool.questions.city.help && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t.planning.personalizedTool.questions.city.help}
          </p>
        )}
        <input
          type="text"
          value={situation.city || ""}
          onChange={(e) => updateSituation({ city: e.target.value || undefined })}
          placeholder={t.planning.personalizedTool.questions.city.placeholder}
          className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleNext}
          className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          {t.common.next}
        </button>
      </div>
    );
  };

  /**
   * Render step 6: Review
   */
  const renderReview = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Review Your Answers</h2>
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <strong>Relationship Status:</strong>{" "}
            {situation.relationshipStatus &&
              t.planning.personalizedTool.questions.relationshipStatus.options[
                situation.relationshipStatus as keyof typeof t.planning.personalizedTool.questions.relationshipStatus.options
              ]}
          </div>
          {situation.pregnancyStage && (
            <div>
              <strong>Pregnancy Stage:</strong>{" "}
              {
                t.planning.personalizedTool.questions.pregnancyStage.options[
                  situation.pregnancyStage as keyof typeof t.planning.personalizedTool.questions.pregnancyStage.options
                ]
              }
            </div>
          )}
          {situation.childAge && (
            <div>
              <strong>Child Age:</strong>{" "}
              {
                t.planning.personalizedTool.questions.childAge.options[
                  situation.childAge as keyof typeof t.planning.personalizedTool.questions.childAge.options
                ]
              }
            </div>
          )}
          {situation.relationshipStatus !== "married" && (
            <>
              <div>
                <strong>Paternity Acknowledged:</strong>{" "}
                {situation.hasPaternityCertificate ? t.common.yes : t.common.no}
              </div>
              <div>
                <strong>Joint Custody:</strong>{" "}
                {situation.hasJointCustody ? t.common.yes : t.common.no}
              </div>
            </>
          )}
          <div>
            <strong>Relationship Stable:</strong>{" "}
            {situation.relationshipStable ? t.common.yes : t.common.no}
          </div>
          {situation.city && (
            <div>
              <strong>City:</strong> {situation.city}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            if (isValidSituation()) {
              onComplete(situation as UserSituation);
            }
          }}
          className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          {t.planning.personalizedTool.results.title}
        </button>
      </div>
    );
  };

  /**
   * Render current step
   */
  const renderCurrentStep = () => {
    // Skip steps for married couples
    if (situation.relationshipStatus === "married") {
      if (step === 2 || step === 3) {
        // Skip paternity and joint custody steps
        if (step === 2) {
          return renderRelationshipStable();
        }
        if (step === 3) {
          return renderCity();
        }
      }
    }

    switch (step) {
      case 0:
        return renderRelationshipStatus();
      case 1:
        return renderPregnancyOrChildAge();
      case 2:
        return renderPaternityCertificate() || renderRelationshipStable();
      case 3:
        return renderJointCustody() || renderCity();
      case 4:
        return renderRelationshipStable();
      case 5:
        return renderCity();
      case 6:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>
            {t.common.step
              .replace("{idx}", String(step + 1))
              .replace("{total}", String(totalSteps))}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        {renderCurrentStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={step === 0}
          className={`px-6 py-2 rounded-lg border-2 transition-all ${
            step === 0
              ? "border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
              : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {t.common.back}
        </button>
        {step < totalSteps - 1 && (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentStepValid()}
            className={`px-6 py-2 rounded-lg transition-all ${
              isCurrentStepValid()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {t.common.next}
          </button>
        )}
      </div>
    </div>
  );
}
