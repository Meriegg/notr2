# Why?

I made this application to help me manage my text files.

# Features

This application provides the following features:
1. A file tree where you can create/nest folders and notes allowing you to structure your notes in such a way that you can easily find whatever you are searching for.
2. A chrome extension providing you fast access to your notes (useful if you store passwords in your notes) 
3. It is fully self-hostable, in fact you have to self host it in order to use it, removing any security risks that come with these types of apps.

# How can you self host it?

The only things you need to self host this app is a PostgreSQL database and pnpm version 8.14.1 or higher (older version may also work, but if you face any issues, just update pnpm by running `npm install pnpm -G`).

After you set up your database you can clone the repo by running

```
git clone https://github.com/Meriegg/notr2.git
```

After that you need to install the packages:

```
pnpm install
```

Now you need to set up the environment variables (see .env.example):

```
touch .env
```

Contents:

```
DATABASE_URL="postgres://postgres:postgres@localhost:5432/notr" # only an example
SECRET_KEY="p8kKZ81mrSi42G8D30wulFyviYhc7X98fKsRd68qzrs=" # 32 character string
NODE_ENV="production" # can also be set to `development`
```

After this you need to build your app:

```
pnpm run build
```

And now you can start your app!

```
pnpm run start
```

# Docker guide 

Docker guide is coming soon.

# Enjoy!
