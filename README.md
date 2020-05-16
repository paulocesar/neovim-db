# neovim-db
Database plugin for neovim

### Screenshot

![neovim-db screenshot](/misc/example.png)

### Install

- clone this repo into `~/.config/nvim/rplugin/node`
- run a `npm install` in the neovim-db folder
- open `nvim` and run the `:UpdateRemotePlugins` command
- create a `~/.nvim-db.json` fo;e (please check the `Usage` section)
- restart nvim

### Usage

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
