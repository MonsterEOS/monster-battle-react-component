module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: false
  },
  webpack: {
    extra: {
      module: {
        rules: [
          {
            test: /\.(gltf|glb|obj|glsl)$/,
            use: [
              {
                loader: 'file-loader',
                options: {}
              }
            ]
          }
        ]
      }
    }
  }
}
