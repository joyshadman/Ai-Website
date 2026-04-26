import React from 'react'

const Footer = () => {
  return (
    <div>
        <div className="border-t border-white/10 py-8 bg-black">
            <p className="text-center text-gray-500">
                &copy; {new Date().getFullYear()} Apexium AI. All rights reserved.
            </p>
        </div>
    </div>
  )
}

export default Footer