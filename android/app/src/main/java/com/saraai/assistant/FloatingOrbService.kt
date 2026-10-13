package com.saraai.assistant

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.ImageView

class FloatingOrbService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var floatingOrb: View

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        
        // Inflate a simple layout for the orb (you can define this in XML)
        floatingOrb = ImageView(this).apply {
            setImageResource(android.R.drawable.star_big_on) // Placeholder for Orb icon
            // Set size or styling here
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.TOP or Gravity.START
        params.x = 0
        params.y = 100

        windowManager.addView(floatingOrb, params)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::floatingOrb.isInitialized) {
            windowManager.removeView(floatingOrb)
        }
    }
}
