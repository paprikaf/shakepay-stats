module.exports = {
  reactStrictMode: true,
  // target: "serverless", in case we want to deploy for netlify
  // distDir: 'dist',
  api: {
    bodyParser: false
  },
  //using rewrites to  URL proxy shakepay/rates
  async rewrites () { 
    return [
      {
        source: '/api/rates',
        destination: "https://api.shakepay.com/rates",
      },
    ]
  } 
}