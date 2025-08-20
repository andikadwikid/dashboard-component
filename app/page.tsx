import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import IndonesiaMap from "@/components/AppChartMapIndo";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";

export default function Home() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 border-1">
          {/* <AppBarChart /> */}
          <IndonesiaMap />
        </div>
        <div className="bg-card p-4 rounded-lg border-1">
          <CardList title="Latest Transactions" />
        </div>
        <div className="bg-card p-4 rounded-lg border-1">
          <AppPieChart />
        </div>
        <div className="bg-card p-4 rounded-lg border-1">
          <TodoList />
        </div>
        <div className="bg-card p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 border-1">
          {/* <AppAreaChart /> */}
          <AppBarChart />
        </div>
        <div className="bg-card p-4 rounded-lg border-1">
          <CardList title="Popular Content" />
        </div>
      </div>
    </>
  );
}