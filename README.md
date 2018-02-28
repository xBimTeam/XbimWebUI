This is forked repository from [https://github.com/xBimTeam/XbimWebUI](https://github.com/xBimTeam/XbimWebUI). Feel free to use it for your needs.

The biggest differences compared to the original library are:

- it uses ES6 features
- method that could be used for adding an extra model to a scene to provided position, with provided scale and color:

```ecmascript 6
viewer.append('sign.wexbim', undefined, {
  x: 200,
  y: 150,
  z: 20,
  scale: 1.5,
  color: [255, 0, 0], // red, green, blue
  onClick: () => {
    alert('the sign was clicked');
  }
});
```

- after model is loaded, geometry object contains information about an model area, so you can know what is real width, height and depth of the model. Here is an example code to compute the center point of the model:

```ecmascript 6
viewer.on('loaded', data => {
  viewer.start();
  
  const centerX = (data.geometry.area.x[0] + data.geometry.area.x[1]) / 2;
  const centerY = (data.geometry.area.y[0] + data.geometry.area.y[1]) / 2;
  const centerZ = (data.geometry.area.z[0] + data.geometry.area.z[1]) / 2;
});
```
