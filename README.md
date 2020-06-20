# Data Journalism and D3

![Newsroom](https://media.giphy.com/media/v2xIous7mnEYg/giphy.gif)

- - -

### Interactive Plot

Why make a static graphic when D3 lets you interact with your data?

![7-animated-scatter](Images/7-animated-scatter.gif)

#### 1. More Data, More Dynamics

You're going to include more demographics and more risk factors. Place additional labels in your scatter plot and give them click events so that your users can decide which data to display. Do this for the risk factors in the data.

*  Include animations by adding the transitions for your circles' locations and the range of the axes.

* Binding all the .csv data to your circles allows their x or y values to be easily accessed upon click.

#### 2. Incorporate d3-tip

Use the `d3-tip.js` plugin developed by [Justin Palmer](https://github.com/caged/d3-tip). Include a d3-tip for each bubble to display the current x and y values.

* Refer to [David Gotz's example](https://bl.ocks.org/davegotz/bd54b56723c154d25eedde6504d30ad7) as a guide for d3-tip.

![8-tooltip](Images/8-tooltip.gif)

#### 3. Heroku Deploy

Deploy static website with Heroku. 

Create an index.php file within the main directory and place the following:

```php
<?php header( 'Location: /index.html' ) ;  ?>
```

Within the main directory in Git. Use the Heroku CLI to create an application and deploy to Heroku.

```
git init
git add .
git commit -m "First deploy"
heroku apps:create my-site-name
git push heroku master
```

