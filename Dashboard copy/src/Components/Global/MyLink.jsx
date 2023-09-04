// LinkWithGlobalState.js
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { Link } from 'react-router-dom';

function MyLink(props) {
  const { setLoaded, setOpen } = useContext(AppContext);

  const handleClick = () => {
    setLoaded(false);
  };

  return <Link {...props} onClick={handleClick} />;
}

export default MyLink;
