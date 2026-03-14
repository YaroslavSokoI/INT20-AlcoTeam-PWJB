import { QuizContainer } from './components/QuizContainer';


export default function App() {
  return (
    <div className="min-h-[100dvh] w-full flex justify-center bg-bg font-sans selection:bg-brand/20">
      <main className="w-full max-w-[480px] min-h-[100dvh] bg-bg flex flex-col relative mx-auto overflow-hidden">
        <QuizContainer />
      </main>
    </div>
  );
}
