interface PageBackgroundProps {
  image: string;
}

export function PageBackground({ image }: PageBackgroundProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${image}')` }}
      />
      <div className="fixed inset-0 z-0 bg-black/50" />
    </>
  );
}
