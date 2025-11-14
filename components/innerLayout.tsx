"use client"
import React from 'react'
import { Provider } from 'react-redux'
import { Navigation } from './navbar'
import { store } from '@/store/store'

const InnerLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Provider store={store}>
          <Navigation/>
          {children}
        </Provider>
  )
}

export default InnerLayout