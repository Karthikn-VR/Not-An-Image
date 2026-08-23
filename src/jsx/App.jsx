import HeroScene from './HeroScene.jsx';

export default function App() {
  const handleSelect = (id, section) => {
    console.log('selected', id, '->', section);
  };

  return (
    <main className="page">
      <HeroScene onSelect={handleSelect} />
    </main>
  );
}
