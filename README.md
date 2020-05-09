# neovim-db
Database plugin for neovim

usage:

```vim
:DbRunQuery
```

shortcup suggestion:

```vim
nnoremap <F5> :DbRunQuery<CR>
```


set your DB configurations in `~/.nvim-db.js`:

```js
module.exports = {
    default: {
        client: 'mssql',
        connection: {
            host: 'host1',
            username: 'user1',
            password: 'pw1,
            database: 'db1'
        }
    }
    anotherLabel: {
        client: 'mysql',
        connection: {
            host: 'host2',
            username: 'user2',
            password: 'pw2',
            database: 'db2'
        }
    },
};
```

example of query:
```sql
--> anotherLabel

SELECT * FROM users WHERE Id = 1
```
