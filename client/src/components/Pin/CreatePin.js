import React, { useState, useContext } from "react";
import { GraphQLClient } from 'graphql-request';
import axios from 'axios';
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddAPhotoIcon from "@material-ui/icons/AddAPhotoTwoTone";
import LandscapeIcon from "@material-ui/icons/LandscapeOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/SaveTwoTone";
import Context from "../../context";
import { CREATE_PIN_MUTATION } from "../../graphql/mutations";

const CreatePin = ({ classes }) => {
  const { state, dispatch } = useContext(Context);
  // Component state
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

const handleDeleteDraft = () => {
  setTitle('');
  setImage('');
  setContent('');
  dispatch({ type: "DELETE_DRAFT"}); // remove draft from Context via reducer
};

const handleImageUpload = async () => {
  const data = new FormData();
  data.append("file", image);
  data.append("upload_preset", "geopins");
  data.append("cloud_name", "shimages");

  const res = await axios.post("https://api.cloudinary.com/v1_1/shimages/image/upload", data);
  console.log(res.data.url)
  return res.data.url;
};

const handleSubmit = async (e) => {
  try {
    e.preventDefault();
    setSubmitting(true);
    
      // Get user Auth Token
    const idToken = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    
      // Create new GQL Client with token
    const client = new GraphQLClient('http://localhost:4000/graphql', {
      headers: { authorization: idToken }
    });
    
      // Gather and set variables to pass to GraphQL via a client request:
      // Coords from the pin draft data in context
    const { latitude, longitude } = state.draft; 
      // Get Cloudinary url for image upload
    const url = await handleImageUpload();

    const variables = { title, image: url, content, latitude, longitude }
    
      // Send data to GraphQL to create data mutation (ie add item)
    const data = await client.request(CREATE_PIN_MUTATION, variables);
    const { createPin } = data; // Destructure createPin from data received by client request
    
    
    console.log("Pin created: ", { createPin });

    handleDeleteDraft(); // Clear form and draft pin coords
  } catch(err) {
    setSubmitting(false);
    console.error("Error creating pin ", err);
  }
};

  return (
    <form className={classes.form}>
      <Typography
        className={classes.alignCenter}
        component='h2'
        variant='h4'
        color='secondary'
      >
        <LandscapeIcon className={classes.iconLarge} />
        Pin Location
      </Typography>
      <div>
        <TextField 
          name='title'
          label='Title'
          placeholder='Add a title...'
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          accept='image/*'
          id='image'
          type='file'
          className={classes.input}
          onChange={(e) => setImage(e.target.files[0])}
        />
        <label htmlFor='image'>
          <Button
          style={{ color: image && 'green'}}
            component='span'
            size='small'
            className={classes.button}
          >
            <AddAPhotoIcon />
          </Button>
        </label>
      </div>
      <div className={classes.contentField}>
        <TextField
          name='content'
          label='Pin Description'
          placeholder="Let us know what's interesting here!"
          multiline
          rows='6'
          margin='normal'
          fullWidth
          variant='outlined'
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div>
        <Button
        onClick={handleDeleteDraft}
          className={classes.button}
          variant='contained'
          color='primary'
        >
          <ClearIcon className={classes.leftIcon} />
          Discard
        </Button>
        <Button
          type='submit'
          className={classes.button}
          variant='contained'
          color='secondary'
          disabled={!title.trim() || !content.trim() || !image || submitting }
          onClick={handleSubmit}
        >
          Submit
          <SaveIcon className={classes.righttIcon} />
        </Button>
      </div>
    </form>
  )
};

const styles = theme => ({
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: theme.spacing.unit
  },
  contentField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "95%"
  },
  input: {
    display: "none"
  },
  alignCenter: {
    display: "flex",
    alignItems: "center"
  },
  iconLarge: {
    fontSize: 40,
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    fontSize: 20,
    marginLeft: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
    marginLeft: 0
  }
});

export default withStyles(styles)(CreatePin);
