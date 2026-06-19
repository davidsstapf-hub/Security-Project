import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir:'./tests/e2e-beta', timeout:60000, fullyParallel:false, workers:2,
  webServer:{command:'npm run dev:beta -- --host 127.0.0.1 --port 4174',url:'http://127.0.0.1:4174',reuseExistingServer:false},
  use:{baseURL:'http://127.0.0.1:4174',trace:'retain-on-failure'},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome']}},
    {name:'mobile',use:{browserName:'chromium',viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
  ],
})
