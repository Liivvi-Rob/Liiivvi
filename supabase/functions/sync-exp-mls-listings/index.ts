import { serve } from 'std/server'

serve(async (req) => {
  return new Response(JSON.stringify({
    status: 'placeholder',
    message: 'MLS sync endpoint placeholder. Implement server-side syncing logic here.'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
