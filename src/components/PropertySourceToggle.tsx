interface PropertySourceToggleProps {
  showFSBO: boolean
  showMLS: boolean
  onToggle: (source: 'fsbo' | 'mls', value: boolean) => void
}

function PropertySourceToggle({ showFSBO, showMLS, onToggle }: PropertySourceToggleProps) {
  const handleToggle = (source: 'fsbo' | 'mls') => {
    const newValue = source === 'fsbo' ? !showFSBO : !showMLS

    // Don't allow both to be off
    if (!newValue && (source === 'fsbo' ? !showMLS : !showFSBO)) {
      // If trying to turn off the last one, turn both on
      onToggle('fsbo', true)
      onToggle('mls', true)
      return
    }

    onToggle(source, newValue)
  }

  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">FSBO</span>
        <button
          onClick={() => handleToggle('fsbo')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showFSBO ? 'bg-purple-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showFSBO ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">MLS</span>
        <button
          onClick={() => handleToggle('mls')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showMLS ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showMLS ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

export default PropertySourceToggle