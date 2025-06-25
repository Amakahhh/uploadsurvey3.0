export default function SurveySuccess() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center bg-white border p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">🎉 Payment Successful!</h1>
        <p className="mb-6">Your survey has been launched on SurveyHustler.</p>
        <a
          href="https://t.me/suveyhustler_test_bot"
          target="_blank"
          className="bg-[#B3935E] text-white px-4 py-2 rounded inline-flex items-center gap-2"
        >
          <img src="/Ellipse 9.svg" className="w-6 h-6" />
          Go to Telegram Bot
        </a>
      </div>
    </div>
  );
}
