export default function Cookies() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Cookie Policy</h1>
      <p className="text-sm opacity-70">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-4 text-sm leading-6">
        <p>We use cookies to keep you signed in, remember preferences, and analyse site usage.</p>
        <h2 className="font-header text-lg">Types of Cookies</h2>
        <ul className="list-disc pl-5">
          <li>Essential (authentication, security)</li>
          <li>Performance (analytics)</li>
          <li>Preferences (remembering settings)</li>
        </ul>
        <h2 className="font-header text-lg">Managing Cookies</h2>
        <p>You can control cookies in your browser settings.</p>
      </div>
    </div>
  )
}
