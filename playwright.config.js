import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir:'./tests/e2e', timeout:60000, fullyParallel:false, workers:2,
  webServer:{command:'pnpm run dev -- --host 127.0.0.1',url:'http://127.0.0.1:5173',reuseExistingServer:true},
  use:{baseURL:'http://127.0.0.1:5173',trace:'retain-on-failure'},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome']}},
    {name:'mobile',use:{browserName:'chromium',viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
    {name:'tablet',use:{browserName:'chromium',viewport:{width:820,height:1180},isMobile:true,hasTouch:true}},
  ],
})
