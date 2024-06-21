const Dotenv = require('dotenv-webpack')

const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    plugins: [
      new Dotenv()
    ]
  }
}
