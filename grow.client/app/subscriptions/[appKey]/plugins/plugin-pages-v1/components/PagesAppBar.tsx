import * as React from "react";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";

import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
// import useUser from './../../../services/User/useUser';

// const settings = ["Profile", "Account", "Dashboard", "Logout"];
const settings = ["Logout"];

const drawerWidth = 200;

function DynamicAppBar({ pages, user }) {
  const theme = useTheme();

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const segments = useSelectedLayoutSegments();

  // const [user] = useUser();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const userSplit = user.split(" ");
  let userInitials = "NA"
  if (userSplit.length > 1) {
    userInitials = userSplit[0][0]+userSplit[1][0]
  }
  else if (userSplit[0].length > 1) {
    userInitials = userSplit[0][0] + userSplit[0][1]
  }
  else {
    userInitials = userSplit[0][0]
  }
  

  return (
    <AppBar
      position="sticky"
      color="transparent"
      sx={{
        width: { xs: "100%", md: `calc(100% - ${drawerWidth}px - 15px)` },
        marginLeft: { xs: "0", md: `${drawerWidth}px` },
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        borderBottom: "1px solid lightgray",
        backdropFilter: "blur(8px)",
        boxShadow: "none",
        zIndex: (theme) => theme.zIndex.drawer + 0,
      }}
    >
      <Toolbar>
        <Box sx={{ display: { xs: "flex", md: "none" }, pt: 1 }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: "block", md: "none" },
            }}
          >
            {Object.keys(pages).map((page) => (
              <MenuItem key={page} onClick={handleCloseNavMenu}>
                <Link href={`/${segments.slice(0, 2).join("/")}/${page}`}>
                  <Typography textAlign="center">
                    {pages[page]?.display_name ?? page}
                  </Typography>
                </Link>
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: { xs: "flex" },
            ml: 2,
            mr: 4,
            alignItems: "flex-end"
          }}
        >
          <SearchIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <TextField
            id="standard-search"
            label="Search"
            type="search"
            size="small"
            variant="standard"
            fullWidth
          />
        </Box>

        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={user} sx={{ bgcolor: theme.palette.primary.light }}>
                {userInitials?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting) => (
              <Link key={setting} href={`/`} style={{ width: "100%" }}>
                <MenuItem onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              </Link>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
}

export default DynamicAppBar;
