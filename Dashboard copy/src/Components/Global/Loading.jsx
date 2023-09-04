import React, { useEffect, useRef } from 'react'

function Loading({ loading }) {
  return (
    // square loading animation
    <div className={`pointer-events-none fixed z-[100] left-0 w-screen h-screen flex items-center justify-center bg-tertiary transition-all duration-500 ${loading ? 'opacity-0 ' : 'flex top-0'}`}>
        <div className="relative w-[60px] h-[60px] border-4 border-rose-600 border- rounded-full animate flex justify-center items-center animate-spin">
            <div className="absolute w-[65px] h-[65px] border-8 border-transparent rounded-full border-t-light-primary-500dark-soft  border-b-light-primary-500dark-soft "></div>
        </div>
    </div>
  )
}

export default Loading