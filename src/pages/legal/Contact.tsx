export default function Contact() {
  return (
    <div className="space-y-4">
      <h1 className="font-header text-2xl">Contact</h1>
      <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-soft space-y-3 text-sm">
        <p>Questions about an order or consignment? We’re here to help.</p>
        <p>Email: <a className="underline" href="mailto:support@nozcards.com">support@nozcards.com</a></p>
        <p>Response time: typically within 1–2 business days.</p>
      </div>
    </div>
  )
}
