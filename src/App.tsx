import { Header } from "./components/Header";
import { PvCalculator } from "./modules/calculator";

function App() {
  return (
    <div className="min-h-full bg-heizma-bg">
      <Header />
      <main>
        <PvCalculator />
      </main>
    </div>
  );
}

export default App;
