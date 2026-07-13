import Nav from "../../components/Nav";
import TibetanOcrUpload from "../../components/TibetanOcrUpload";

export default function TibetanOcrPage() {
  return (
    <main className="min-h-screen bg-white" style={{ paddingTop: "72px" }}>
      <Nav />
      <TibetanOcrUpload />
    </main>
  );
}
