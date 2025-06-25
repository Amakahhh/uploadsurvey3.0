import Image from 'next/image';

export default function UploadSurvey() {
  return (
    <div className="min-h-screen bg-[#fdfaf7] px-4 py-6 sm:px-8 lg:px-24 text-[#3e342c]">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Image src="/surveyquest-logo.png" alt="SurveyQuest Logo" width={40} height={40} />
            <h1 className="text-xl sm:text-2xl font-semibold">Upload a Survey</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-green-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">A</div>
            <span className="text-sm font-medium">Abiodun Ayandola</span>
          </div>
        </div>

        {/* Steps Content */}
        <div className="space-y-6 text-sm sm:text-base">
          <div>
            <h2 className="font-bold">Linking your Google Form</h2>
            <p className="mb-2">We’re ready to get your survey out there quickly. Please do the following:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open your Google Form.</li>
              <li>Click on the <strong>Share</strong> button.</li>
              <li>
                Add <code className="bg-gray-100 px-1 py-0.5 rounded">surveyshuffler@gmail.com</code> as an editor.
              </li>
              <li>
                Change the access to <strong>Editor</strong> and ensure the “Notify people” checkbox is clicked.
              </li>
              <li>Click on <strong>Done</strong>.</li>
            </ol>
          </div>

          {/* Image placeholder */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <Image
              src="/upload-survey-example.png"
              alt="Form Sharing Example"
              width={800}
              height={450}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Additional Settings */}
          <div>
            <h2 className="font-bold">Additional Settings</h2>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Click on <strong>Settings</strong> in your Google form.</li>
              <li>
                Go to <strong>Responses</strong> section, ensure “Collect email addresses” is set to <strong>Responder input</strong> and “Limit to 1 response” is <strong>turned on</strong>.
              </li>
            </ol>
          </div>

          {/* Input Field */}
          <div>
            <label className="block font-medium mb-1">Done?</label>
            <input
              type="text"
              placeholder="Enter link here"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Note */}
          <div className="text-xs text-gray-600 bg-yellow-100 p-3 rounded-md">
            <strong>Note:</strong> If we notice any of these settings have been tampered with after upload, your survey will be automatically taken down from the platform.
          </div>

          {/* Button */}
          <button
            className="w-full sm:w-auto bg-yellow-700 hover:bg-yellow-800 text-white px-6 py-2 rounded-md flex items-center justify-center space-x-2 transition duration-200"
          >
            <span>Next</span>
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v4m0 8v4m8-8h4M4 12H0m16.24-7.76l2.83 2.83M5.93 18.07l-2.83 2.83M18.07 18.07l2.83-2.83M5.93 5.93L3.1 8.76" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
