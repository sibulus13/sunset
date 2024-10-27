import { calculateSunsetPredictions } from "~/lib/sunset/sunset";
import { type WeatherForecast, type Prediction } from "~/lib/sunset/type";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Sun, Clock, Hourglass } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const getScoreGradient = (score: number) => {
  const baseColors = ["from-orange-300 via-pink-400 to-purple-500"];
  const saturation = score; // Use score directly for saturation
  return { color: `${baseColors[0]}`, saturation: saturation };
};

const formatTime = (timeString: string) => {
  // TODO: Use the user's locale to format the time
  return new Date(timeString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// If the new date is today, display "Today" instead of the date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  if (date.getDate() === today.getDate()) {
    return "Today";
  } else {
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
};

// Normalize score to a range between 13 and 93
const truncateScore = (score: number, lowerLimit = 0, upperLimit = 93) => {
  const range = upperLimit - lowerLimit;
  score = (score / 100) * range + lowerLimit;
  return score.toFixed(0);
};

export default async function Component() {
  // Removed: const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const latitude = 49.1913033;
  const longitude = -122.849143;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=weather_code,relative_humidity_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility&daily=sunrise,sunset,daylight_duration,sunshine_duration`;
  console.log(url);
  const res = await fetch(url);
  const forecast = (await res.json()) as WeatherForecast;
  const predictions = calculateSunsetPredictions(forecast) as Prediction[];
  console.log(predictions[0]);

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-center text-3xl font-bold text-primary">
          Sunset Prediction Dashboard
        </h1>
        <div className="group grid gap-4 md:grid-cols-3">
          {predictions.map((prediction) => (
            <Card
              key={prediction.date}
              className={`bg-gradient-to-br ${getScoreGradient(prediction.score.score).color} transition-all duration-300 ease-in-out hover:scale-105 hover:!opacity-100 group-hover:opacity-60`}
              style={{
                filter: `saturate(${getScoreGradient(prediction.score.score).saturation}%)`,
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  {formatDate(prediction.date)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between">
                <div className="flex flex-col items-center">
                  <Sun className="mb-2 h-12 w-12 text-yellow-500" />
                  <span className="text-4xl font-bold">
                    {truncateScore(prediction.score.score)}
                  </span>
                  {/* <span className="text-sm font-medium">Sunset Score</span> */}
                </div>
                <div className="mt-4 flex flex-col items-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-xs">
                          {formatTime(prediction.sunset)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sunset Time</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1">
                        <Hourglass className="h-4 w-4 text-primary" />
                        <span className="text-xs">
                          {formatTime(prediction.golden_hour.start)} -{" "}
                          {formatTime(prediction.golden_hour.end)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Golden Hour</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
