export default function HamburgerButton({ isOpen, onToggle, ariaControls }) {
  return (
    <button
      type="button"
      className="md:hidden text-white focus:outline-none focus-visible:ring focus-visible:ring-ecoGreen rounded-lg p-2"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls={ariaControls}
      onClick={onToggle}
    >
      {/* Simple 3-bar icon with state animation via utility classes if desired */}
      <span className="block w-6 h-0.5 bg-white mb-1" />
      <span className="block w-6 h-0.5 bg-white mb-1" />
      <span className="block w-6 h-0.5 bg-white" />
    </button>
  )
}
