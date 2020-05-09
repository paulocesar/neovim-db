# neovim-db
Database plugin for neovim

usage:

```vim
:DbRunQuery
```

shortcut suggestion:

```vim
" run a query when press F5
nnoremap <F5> :DbRunQuery<CR>
```


set your DB settings in `~/.nvim-db.json`:

```json
{
    "default": {
        "client": "mssql",
        "connection": {
            "host": "host1",
            "user": "user1",
            "password": "pw1",
            "database": "db1"
        }
    },
    "anotherLabel": {
        "client": "mysql",
        "connection": {
            "host": "host2",
            "user": "user2",
            "password": "pw2",
            "database": "db2"
        }
    }
}
```

example of query:
```sql
--> anotherLabel

SELECT * FROM users WHERE Id = 1
```
