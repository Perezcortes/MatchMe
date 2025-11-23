import OnboardingForm from './src/components/onboarding-form';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          MatchMe
        </h1>
        <p className="text-gray-600 text-lg">Conexiones reales potenciadas por IA</p>
      </div>
      
      <OnboardingForm />
    </main>
  );
}