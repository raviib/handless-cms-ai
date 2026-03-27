import React from 'react'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { withSwal } from 'react-sweetalert2';
const ImageDeleteUi = ({ swal, deleteHandler, Link, field }) => {
    return (
        <DeleteSweepIcon className='table-delete-icon iconButton' onClick={() => {

            // const answer = window.confirm("Are You Sure ?");
            // if (answer) {
            //     deleteHandler(Link)
            // }
            swal.fire({
                title: 'Are you sure?',
                text: `You won't be able to revert this Image!`,
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonText: 'Yes, Delete!',
                confirmButtonColor: '#d55',
                cancelButtonColor: '#08569c',
                reverseButtons: true,
            }).then(async result => {
                if (result.isConfirmed) {
                    deleteHandler(Link, field)
                }
            })

        }} />)
}

// export default ImageDeleteUi
export default withSwal(({ swal, deleteHandler, Link, field }) => (
    <ImageDeleteUi swal={swal} deleteHandler={deleteHandler} Link={Link} field={field} />
))