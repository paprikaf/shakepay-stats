module.exports = {
  reactStrictMode: true,
  target: "serverless", 
  // distDir: 'dist',//in case we want to deploy for netlify
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
      {
        source: '/api/csv',
        destination: '/api/csv'
      }
      ,
    ]
  } 
}