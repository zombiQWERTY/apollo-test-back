const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User {
    email: String
  }

  type Tokens {
    accessToken: String
  }

  input LoginInput {
    email: String,
    password: String
  }

  type Author {
    id: ID!,
    firstName: String!,
    lastName: String!,
    biography: String!,
    bookCount: Int!
  }

  type Book {
    id: ID!,
    author: ID!,
    name: String!,
    postDate: String!,
    description: String!,
    authorInfo: Author,
  }

  type Comment {
    id: ID!,
    bookId: ID!,
    name: String!,
    comment: String!,
  }
  
  type BooksWithCount {
    books: [Book!]!
    count: Int!
  }
  
  type AuthorsWithCount {
    authors: [Author!]!
    count: Int!
  }
  
  type CommentsWithCount {
    comments: [Comment!]!
    count: Int!
  }

  type Queries {
    user: User,
    author(id: ID!): Author!,
    authors(offset: Int, limit: Int): AuthorsWithCount!,
    book(id: ID): Book!,
    books(offset: Int, limit: Int): BooksWithCount!,
    booksByAuthor(id: ID!): [Book!]!,
    comments(bookId: ID!, offset: Int, limit: Int): CommentsWithCount!
  }

  type Mutations {
    login(data: LoginInput): Tokens
  }

  schema {
    query: Queries,
    mutation: Mutations
  }
`;

const authorsList = require('./data/authors.json')
const booksList = require('./data/books.json')
const commentsList = require('./data/comments.json')

const resolvers = {
  Queries: {
    author: async (_, args) => {
      const authors = authorsList.map(author => {
        return {
          ...author,
          bookCount: booksList.filter(book => book.author === author.id).length
        }
        return author;
      })

      return authors.find(author => author.id === parseInt(args.id, 10))
    },
    authors: async (_, args) => {
      const authors   = authorsList.map(author => {
        return {
          ...author,
          bookCount: booksList.filter(book => book.author === author.id).length
        }
        return author;
      })

      const authorCount = authors.length

      return {
        authors: authors.splice(parseInt(args.offset, 10), parseInt(args.limit, 10)),
        count: authorCount
      }
    },
    books: async (_, args) => {
      const books = booksList.map(book => {
        return {
          ...book,
          authorInfo: authorsList.filter(author => author.id === book.author)[0]
        }
        return author;
      })

      const bookCount = books.length

      return {
        books: books.splice(parseInt(args.offset, 10), parseInt(args.limit, 10)),
        count: bookCount
      }
    },
    booksByAuthor: async (_, args) => {
      return booksList.filter(book => book.author === parseInt(args.id, 10))
    },
    book: async (_, args) => {
      const books = booksList.map(book => {
        return {
          ...book,
          authorInfo: authorsList.filter(author => author.id === book.author)[0]
        }
        return author;
      })

      return books.find(book => book.id === parseInt(args.id, 10))
    },
    comments: async (_, args) => {
      const commentsCount = commentsList.length
      return {
        comments: commentsList.filter(comment => comment.bookId === parseInt(args.bookId, 10)).splice(args.offset, args.limit),
        count: commentsCount
      }
    }
  },
  Mutations: {
    login: (root, args, context) => {
      return {
        accessToken:
          "some token that we won't parse on front 'cause of fake auth"
      };
    },
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const app = express();
server.applyMiddleware({
  app: app,
  cors: {
    credentials: true,
    origin: true
  },
  path: "/",
});

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
