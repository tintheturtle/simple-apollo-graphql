# Simple Graphql Express Server

## Development

`npm install`

`npm run dev`

Go to: [http://localhost:4000/graphql](http://localhost:4000/graphql)

### Run this in Playground

```
query {
  books {
    title
    author
  }
}
```

## Production

`npm run build`

`npm run serve`


## Use docker mongo
```
docker run -d --restart always -p 27017:27017 -v ~/data:/data/db --name mongodb mongo
```
