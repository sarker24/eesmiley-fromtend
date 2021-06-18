import {
  Button,
  createStyles,
  DialogActions,
  GridList,
  GridListTile,
  IconButton,
  Slider,
  Theme,
  withStyles,
  WithStyles,
  withWidth,
  WithWidthProps
} from '@material-ui/core';
import ReactPlaceholder from 'react-placeholder';
import Image from '@material-ui/icons/Image';
import CheckIcon from '@material-ui/icons/Check';
import ImageEditor from 'react-avatar-editor';
import FileField from 'modalContent/image-gallery/fileField';
import * as React from 'react';
import { connect } from 'react-redux';
import { create, find, Media, MediaActions } from 'redux/ducks/media';
import * as uiDispatch from 'redux/ducks/ui';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import classNames from 'classnames';
import { RootState } from 'redux/rootReducer';
import { ThunkDispatch } from 'redux-thunk';
import { UiActions } from 'redux/ducks/ui';

const styles = (theme: Theme) =>
  createStyles({
    header: {
      background: theme.palette.primary.main,
      color: theme.palette.common.white,
      padding: theme.spacing(2),
      textAlign: 'center',
      '& h3': {
        fontWeight: 100,
        fontSize: '2rem',
        margin: 0
      }
    },
    modalContent: {
      display: 'flex',
      flexFlow: 'row wrap',
      '& > *': {
        flex: '1 1 48%'
      },
      height: '400px'
    },
    image: {
      width: '100%',
      height: '100%',
      transition: `transform 0.25s ${theme.transitions.easing.easeInOut}`,
      '&:hover': {
        transform: 'scale(1.1)'
      }
    },
    checkIcon: {
      backgroundColor: theme.palette.common.white,
      borderRadius: '50%',
      position: 'absolute',
      right: 5,
      bottom: 5
    },
    imageButton: {
      padding: 0,
      borderRadius: 0,
      height: '100%',
      width: '100%',
      '& > span': {
        height: '100%'
      }
    },
    inputField: {
      display: 'flex',
      flexFlow: 'row',
      marginTop: theme.spacing(1),
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '250px',
      '& > * + *': {
        marginLeft: theme.spacing(1)
      },
      '& svg': {
        color: theme.palette.common.black,
        fill: theme.palette.common.black
      }
    },
    inputFieldSlider: {
      width: '100%'
    },
    imageEditor: {
      width: '100%'
    },
    imageCropper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexFlow: 'column wrap'
    },
    imageSelected: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%,-50%)'
    },
    galleryWrapper: {
      height: '100%',
      position: 'relative'
    },
    gallery: {
      maxHeight: '100%',
      overflowY: 'auto'
    },
    galleryBlurred: {
      opacity: 0.1,
      overflow: 'hidden',
      pointerEvents: 'none'
    },
    [theme.breakpoints.down('sm')]: {
      modalContent: {
        height: 'auto',
        flexFlow: 'column wrap'
      },
      galleryWrapper: {
        height: '200px'
      },
      fileField: {
        '& input': {
          overflow: 'hidden'
        }
      }
    }
  });

interface OwnProps {
  onSelection: (image: Media) => void;
  imageUrl: string;
}

type StoreProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type ImageGalleryProps = OwnProps &
  StoreProps &
  DispatchProps &
  InjectedIntlProps &
  WithStyles<typeof styles> &
  WithWidthProps;

interface ImageGalleryState {
  file: File;
  scale: number;
  selectedMedia?: Media;
}

class ImageGallery extends React.Component<ImageGalleryProps, ImageGalleryState> {
  imageEditorRef: React.RefObject<ImageEditor>;
  galleryRef: React.RefObject<HTMLDivElement>;
  headerRef: React.RefObject<HTMLDivElement>;

  constructor(props: ImageGalleryProps) {
    super(props);

    this.state = {
      file: null,
      scale: 1,
      selectedMedia: null
    };

    this.galleryRef = React.createRef();
    this.headerRef = React.createRef();
    this.imageEditorRef = React.createRef();
  }

  componentDidMount() {
    void this.props.findImages();
  }

  handleImage = () => {
    const { file, selectedMedia } = this.state;
    const { handleImageUpload } = this.props;

    if (file && this.imageEditorRef.current) {
      const canvasImage = this.imageEditorRef.current.getImage();

      if (canvasImage.toBlob) {
        // todo fix, these props exist on File, lastModifiedDate is deprecated, use lastModified
        canvasImage.toBlob((uploadFile: Blob & { name: string; lastModifiedDate: Date }) => {
          uploadFile.name = file.name;
          uploadFile.lastModifiedDate = new Date();

          void handleImageUpload(uploadFile);

          this.setState({ file: null });
        });
      }
    }

    if (selectedMedia) {
      const { onSelection, closeModal } = this.props;

      onSelection(selectedMedia);
      closeModal();
    }
  };

  render() {
    const { intl, images, loading, closeModal, imageUrl, classes, width } = this.props;
    const { file, scale, selectedMedia } = this.state;
    const [, clickHereToCancel] = intl.messages['settings.imageSelected'].split('#');
    const isMobile = ['xs', 'sm'].includes(width);
    const hasSelectedFile = !!file;
    const hasSelected = (media: Media) => {
      return selectedMedia?.url === media.url || (imageUrl === media.url && !file);
    };

    return (
      <div className='imageModal' ref={this.galleryRef}>
        <div className={classes.header} ref={this.headerRef}>
          <h3>{intl.messages['settings.uploadImage']}</h3>
        </div>
        <div className={classes.modalContent}>
          {file && !file.hasOwnProperty('url') ? (
            <div className={classes.imageCropper}>
              <ImageEditor
                height={200}
                width={200}
                border={40}
                className={classes.imageEditor}
                ref={this.imageEditorRef}
                image={file}
                disableDrop={true}
                scale={scale}
              />
              <div className={classes.inputField}>
                <Image style={{ transform: 'scale(0.75)' }} />
                <Slider
                  className={classes.inputFieldSlider}
                  min={1}
                  max={4}
                  value={scale}
                  step={0.15}
                  onChange={(event, scale: number) => {
                    this.setState({ scale });
                  }}
                />
                <Image />
              </div>
            </div>
          ) : (
            <FileField
              accepts='imageUrl/jpg, imageUrl/jpeg, imageUrl/png, imageUrl/gif'
              limit={1}
              cancelHandler={() => {
                /* no op */
              }}
              onFileReceived={(file) => {
                this.setState({ file });
              }}
              progress={0}
              file={null}
              className={classes.fileField}
            />
          )}
          {(file || images.length > 0) && (
            <ReactPlaceholder type='text' rows={3} ready={!loading} showLoadingAnimation>
              <div className={classes.galleryWrapper}>
                <GridList
                  cellHeight={isMobile ? 80 : 120}
                  cols={isMobile ? 4 : 3}
                  spacing={0}
                  className={classNames(classes.gallery, {
                    [classes.galleryBlurred]: hasSelectedFile
                  })}
                >
                  {images.map((value, index) => (
                    <GridListTile key={index}>
                      <IconButton
                        className={classes.imageButton}
                        onClick={() => this.setState({ selectedMedia: value })}
                      >
                        <img src={value.url} className={classes.image} />
                      </IconButton>
                      {hasSelected(value) && (
                        <CheckIcon className={classes.checkIcon} color='primary' />
                      )}
                    </GridListTile>
                  ))}
                </GridList>
                {hasSelectedFile && (
                  <Button
                    variant='contained'
                    className={classes.imageSelected}
                    onClick={() => this.setState({ file: null })}
                  >
                    {clickHereToCancel}
                  </Button>
                )}
              </div>
            </ReactPlaceholder>
          )}
        </div>
        <DialogActions>
          <Button onClick={closeModal}>{intl.messages['base.cancel']}</Button>
          <Button variant='contained' color='primary' onClick={this.handleImage}>
            {file && !file.hasOwnProperty('url')
              ? intl.messages['base.upload']
              : intl.messages['base.ok']}
          </Button>
        </DialogActions>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  images: state.media.list,
  loading: state.media.loading,
  uploadedFile: state.media.recentlyCreated
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<unknown, unknown, UiActions | MediaActions>
) => ({
  findImages: () => dispatch(find()),
  closeModal: () => dispatch(uiDispatch.hideModal()),
  handleImageUpload: (data: Blob) => dispatch(create(data))
});

export default connect<StoreProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(withWidth()(withStyles(styles)(ImageGallery))));
