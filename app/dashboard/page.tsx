import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import IndonesiaMap from "@/components/AppChartMapIndo";
import AppPieChart from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";
import CardSection from "@/components/CardSection";

export default async function DashboardPage() {

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4 mb-4">
          <div className="p-4 rounded-lg col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
              <CardSection/>
          </div>

          <div className="p-4 rounded-lg col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
              <CardSection/>
          </div>

          <div className="p-4 rounded-lg col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
              <CardSection/>
          </div>

          <div className="p-4 rounded-lg col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
              <CardSection/>
          </div>
          <div className="p-4 rounded-lg col-span-1 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
          {/* <AppBarChart /> */}
          <IndonesiaMap />
        </div>
        <div className="p-4 rounded-lg col-span-1 lg:col-span-3 xl:col-span-3 2xl:col-span-3">
          <AppBarChart />
        </div>
        <div className="p-4 rounded-lg col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
          <CardList title="Latest Transactions" />
        </div>
        <div className="bg-card border-1 p-4 rounded-lg col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
          <AppPieChart />
        </div>
        <div className="bg-card border-1 p-4 rounded-lg col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
          <TodoList />
        </div>
        {/* <div className="bg-card border-1 p-4 rounded-lg col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
          <CardList title="Popular Content" />
        </div> */}
      </div>
    </>
  );
}