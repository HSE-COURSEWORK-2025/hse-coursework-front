// … импорты оставляем без изменений
import { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import { CustomChart } from "../../components/customChart/CustomChart";
import axios from "axios";
import { useSnackbar } from "notistack";

type Props = {
  onLoaded?: () => void;
};

interface DataPoint {
  x: string;
  y: number;
}

type ChartDataType = {
  pulse: DataPoint[];
  oxygen: DataPoint[];
  sleep: DataPoint[];
  activeMinutes: DataPoint[];
  distance: DataPoint[];
  steps: DataPoint[];
  totalCalories: DataPoint[];
  speed: DataPoint[];
};

type BackendData = {
  data: Array<{ X: string; Y: number }>;
  outliersX: string[];
};

const API_URL = process.env.REACT_APP_DATA_COLLECTION_API_URL || "";
const DATA_TYPES: Record<keyof ChartDataType, string> = {
  pulse: "HeartRateRecord",
  oxygen: "BloodOxygenData",
  sleep: "SleepSessionTimeData",
  activeMinutes: "ActiveMinutesRecord",
  distance: "DistanceRecord",
  steps: "StepsRecord",
  totalCalories: "TotalCaloriesBurnedRecord",
  speed: "SpeedRecord",
};

const transformData = (backendData: BackendData) => ({
  data: backendData.data.map((item) => ({ x: item.X, y: Number(item.Y) })),
  outliers: backendData.outliersX.map((iso) =>
    new Date(iso).getTime().toString(),
  ),
});

export const DataWOutliersChartsPage: React.FC<Props> = ({ onLoaded }) => {
  const [chartData, setChartData] = useState<ChartDataType>(
    Object.keys(DATA_TYPES).reduce(
      (acc, key) => ({ ...acc, [key]: [] }),
      {} as ChartDataType,
    ),
  );

  const [outliers, setOutliers] = useState<
    Record<keyof ChartDataType, string[]>
  >(
    Object.keys(DATA_TYPES).reduce(
      (acc, key) => ({ ...acc, [key]: [] }),
      {} as Record<keyof ChartDataType, string[]>,
    ),
  );

  const [loadingMap, setLoadingMap] = useState<
    Record<keyof ChartDataType, boolean>
  >(
    Object.keys(DATA_TYPES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof ChartDataType, boolean>,
    ),
  );

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchAllData = async () => {
      const requests = (
        Object.entries(DATA_TYPES) as [keyof ChartDataType, string][]
      ).map(async ([key, type]) => {
        try {
          const category =
            key === "pulse" || key === "oxygen"
              ? "raw_data_with_outliers"
              : "processed_data_with_outliers";

          const response = await axios.get<BackendData>(
            `${API_URL}/api/v1/get_data/${category}/${type}`,
          );

          const { data, outliers } = transformData(response.data);
          return { key, data, outliers };
        } catch (error) {
          enqueueSnackbar(`Ошибка загрузки данных для ${key}`, {
            variant: "error",
          });
          return { key, data: [], outliers: [] };
        }
      });

      const results = await Promise.all(requests);

      const newChartData = results.reduce(
        (acc, { key, data }) => ({ ...acc, [key]: data }),
        {} as ChartDataType,
      );
      const newOutliers = results.reduce(
        (acc, { key, outliers }) => ({ ...acc, [key]: outliers }),
        {} as Record<keyof ChartDataType, string[]>,
      );

      setChartData(newChartData);
      setOutliers(newOutliers);
      setLoadingMap(
        Object.keys(DATA_TYPES).reduce(
          (acc, key) => ({ ...acc, [key]: false }),
          {} as Record<keyof ChartDataType, boolean>,
        ),
      );
    };

    fetchAllData();
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (Object.values(loadingMap).every((v) => !v)) {
      onLoaded?.();
    }
  }, [loadingMap, onLoaded]);

  const getInitialRange = (data: DataPoint[]) => {
    if (!data.length) return { min: 0, max: 0 };
    const xValues = data.map((d) => new Date(d.x).getTime());
    return { min: Math.min(...xValues), max: Math.max(...xValues) };
  };

  const selectionColor = "#FF9800";

  const chartConfigs: Record<
    keyof ChartDataType,
    { title: string; unit: string; color: string }
  > = {
    pulse: { title: "Пульс", unit: "уд/мин", color: "#1565C0" },
    oxygen: { title: "Уровень кислорода", unit: "SpO2%", color: "#00897B" },
    sleep: { title: "Время сна", unit: "мин", color: "#00695C" },
    activeMinutes: {
      title: "Минуты активности",
      unit: "мин",
      color: "#FBC02D",
    },
    distance: { title: "Пройденная дистанция", unit: "км", color: "#388E3C" },
    steps: { title: "Количество шагов", unit: "шт", color: "#1976D2" },
    totalCalories: {
      title: "Всего сожжено калорий",
      unit: "ккал",
      color: "#D81B60",
    },
    speed: { title: "Средняя скорость", unit: "км/ч", color: "#5E35B1" },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        🚨 Графики с выбросами
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {(
          Object.entries(chartData) as [keyof ChartDataType, DataPoint[]][]
        ).map(([key, data]) => {
          const config = chartConfigs[key];
          return (
            <Box key={key} sx={{ width: "100%" }}>
              <CustomChart
                title={config.title}
                data={data}
                unit={config.unit}
                verticalLines={outliers[key]}
                highlightIntervals={[]}
                initialRange={getInitialRange(data)}
                lineColor={config.color}
                selectionColor={selectionColor}
                showStatus={true}
                simulateLoading={loadingMap[key]}
              />
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};
