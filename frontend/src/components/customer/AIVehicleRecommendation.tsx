import { ReloadOutlined, RightOutlined, RobotOutlined } from "@ant-design/icons";
import { skipToken } from "@reduxjs/toolkit/query";
import { useState, type FormEvent } from "react";
import { useRecommendVehicleMutation } from "../../redux/api/aiApi";
import { useGetSingleVehicleQuery } from "../../redux/features/vehicle/vehicleApi";
import VehicleCard from "./VehicleCard";

type RecommendationError = {
  data?: {
    message?: string;
  };
  error?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as RecommendationError;

    if (apiError.data?.message) {
      return apiError.data.message;
    }

    if (apiError.error) {
      return apiError.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const AIVehicleRecommendation = () => {
  const [preferences, setPreferences] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [recommendVehicle, { isLoading: isRecommending }] =
    useRecommendVehicleMutation();
  const {
    data: vehicleResponse,
    isFetching: isVehicleFetching,
    isError: isVehicleError,
    error: vehicleError,
  } = useGetSingleVehicleQuery(vehicleId ?? skipToken);

  const isLoading = isRecommending || isVehicleFetching;
  const vehicle = vehicleResponse?.data;
  const hasStartedRecommendation = Boolean(reason || vehicleId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedPreferences = preferences.trim();

    if (!trimmedPreferences) {
      setErrorMessage("Tell us a little about the vehicle you need first.");
      return;
    }

    setErrorMessage("");
    setVehicleId(null);
    setReason("");

    try {
      const response = await recommendVehicle({
        preferences: trimmedPreferences,
      }).unwrap();

      if (!response.data?.vehicleId || !response.data.reason) {
        throw new Error("We could not find a complete vehicle recommendation.");
      }

      setReason(response.data.reason);
      setVehicleId(response.data.vehicleId);
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(
          error,
          "We could not generate a recommendation right now. Please try again."
        )
      );
    }
  };

  const handleNewRecommendation = () => {
    setPreferences("");
    setVehicleId(null);
    setReason("");
    setErrorMessage("");
  };

  const vehicleFetchError = isVehicleError
    ? getErrorMessage(
        vehicleError,
        "We found a recommendation, but could not load that vehicle. Please try again."
      )
    : "";

  return (
    <section
      className="section-shell py-16 sm:py-20"
      aria-labelledby="ai-recommendation-title"
    >
      {!hasStartedRecommendation ? (
        <div className="overflow-hidden rounded-3xl border border-[#eadfd5] bg-white shadow-[0_18px_50px_rgba(23,32,42,0.07)]">
          <div className="grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-14">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0e8] text-xl text-[#ef654e]">
                <RobotOutlined />
              </div>
              <p className="eyebrow">DRIVEPILOT AI ASSISTANT</p>
              <h2
                id="ai-recommendation-title"
                className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-[#17202a] sm:text-4xl"
              >
                Not sure which car is right for you?
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#69716f] sm:text-base">
                Tell us what you are looking for and DrivePilot AI will find the
                best match from our available vehicles.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-[#f8f6f2] p-5 sm:p-6"
            >
              <label
                htmlFor="vehicle-preferences"
                className="mb-3 block text-sm font-semibold text-[#17202a]"
              >
                What would make your drive feel just right?
              </label>
              <textarea
                id="vehicle-preferences"
                value={preferences}
                onChange={(event) => {
                  setPreferences(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="Tell us what you need, e.g. a comfortable hybrid SUV for 5 people..."
                rows={5}
                className="w-full resize-none rounded-xl border border-[#e5ded6] bg-white px-4 py-3 text-sm leading-6 text-[#17202a] outline-none transition placeholder:text-[#9aa19e] focus:border-[#ef654e] focus:ring-2 focus:ring-[#ef654e]/15"
              />
              {errorMessage && (
                <p className="mt-3 text-sm text-[#d9534f]" role="alert">
                  {errorMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#17202a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263746] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isLoading ? "Finding your car..." : "Recommend a Car"}
                {!isLoading && <RightOutlined />}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#eadfd5] bg-[#f8f6f2] px-6 py-8 sm:px-10 sm:py-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">AI RECOMMENDATION</p>
              <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-[#17202a]">
                We found a great match for you
              </h2>
            </div>
            <button
              type="button"
              onClick={handleNewRecommendation}
              className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#ef654e] transition hover:text-[#c94e3d] sm:self-auto"
            >
              <ReloadOutlined /> New Recommendation
            </button>
          </div>

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-[#decfc2] bg-white text-sm text-[#69716f]">
              Finding the right vehicle for you...
            </div>
          ) : vehicle ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(280px,1.05fr)] lg:items-start">
              <VehicleCard vehicle={vehicle} />
              <div className="rounded-2xl border border-[#eadfd5] bg-white p-6 sm:p-7">
                <p className="eyebrow">WHY WE RECOMMEND IT</p>
                <h3 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-[#17202a]">
                  A considered match for your trip
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#69716f]">{reason}</p>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl border border-[#f0c8c1] bg-white p-6 text-sm text-[#d9534f]"
              role="alert"
            >
              {vehicleFetchError ||
                "We could not load the recommended vehicle. Please try again."}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AIVehicleRecommendation;