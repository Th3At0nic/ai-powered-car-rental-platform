import { HeartOutlined, StarFilled } from "@ant-design/icons";
import { Button } from "antd";
import { TVehicle } from "../../types/vehicle";

type TVehicleCardProps = {
  vehicle: TVehicle;
};

const VehicleCard = ({ vehicle }: TVehicleCardProps) => {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <button
          type="button"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
          aria-label={`Add ${vehicle.name} to favorites`}
        >
          <HeartOutlined />
        </button>

        {!vehicle.isAvailable && (
          <div className="absolute left-4 top-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white">
            Unavailable
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {vehicle.brand}
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              {vehicle.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <StarFilled className="text-amber-400" />
            <span className="font-medium text-slate-700">{vehicle.rating}</span>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
          <span>{vehicle.seats} Seats</span>
          <span>{vehicle.transmission}</span>
          <span>{vehicle.fuelType}</span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <span className="text-xl font-bold text-slate-900">
              ${vehicle.pricePerDay}
            </span>
            <span className="text-sm text-slate-500"> / day</span>
          </div>

          <Button
            type="primary"
            disabled={!vehicle.isAvailable}
            className="!h-9 !rounded-lg !border-0"
          >
            Rent Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
