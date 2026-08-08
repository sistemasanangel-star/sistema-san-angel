"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type WeekPoint = { label: string; medicos: number; pacientes: number };
type CategoryPoint = { name: string; value: number; color: string };

export function WeekVisitsChart({ data }: { data: WeekPoint[] }) {
  const hasData = data.some((d) => d.medicos > 0 || d.pacientes > 0);

  if (!hasData) {
    return (
      <p className="text-sm text-gray-400 h-[220px] flex items-center justify-center">
        Sin visitas registradas esta semana.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid vertical={false} stroke="#eef0f2" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#6b7280" }}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          width={24}
        />
        <Tooltip
          cursor={{ fill: "rgba(46,109,164,0.06)" }}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            fontSize: 12,
          }}
        />
        <Bar dataKey="medicos" name="Médicos" fill="#2E6DA4" radius={[4, 4, 0, 0]} />
        <Bar dataKey="pacientes" name="Pacientes" fill="#3BB273" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonutChart({ data }: { data: CategoryPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <p className="text-sm text-gray-400 h-[220px] flex items-center justify-center">
        Aún no hay médicos registrados.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="55%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: d.color }}
            />
            <span className="text-gray-600 truncate">{d.name}</span>
            <span className="ml-auto font-medium text-brand-black">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
