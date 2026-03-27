import ToolTip from "@/app/components/admin/ToolTip.jsx";
import "@/app/styles/admin/AdminFilters.scss";
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
// import DateRange from "@/app/components/admin/extra/DateRange.jsx"
import DownloadExcels from "@/app/components/admin/Excels/DownloadExcels.jsx";
const AdminFilters = ({ children, reset = () => { }, HandleSearch = () => { }, setInput, inputData, setStartDate, StartDate, EndDate, setEndDate, searchPlaceholder, showDateFilter = false, excel_url = '', ShowExcel }) => {
    let today = new Date().toISOString().split('T')[0];
    return (
        <div className="filters-card panel">
            <div className="align-filters">
                {searchPlaceholder && <div className="search-box">
                    <input
                        type="text"
                        className="form-control"
                        placeholder={searchPlaceholder ?? "Search..."}
                        onChange={(e) => setInput(e.target.value)}
                        value={inputData}
                    />
                    <SearchIcon className="span-Icon" />
                </div>}
                {children}
                {showDateFilter && <>

                    <div className="date-filters">
                        <input
                            className="form-control"
                            type="date"
                            name="StartDate"
                            value={StartDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required //done

                        />

                        <p>-</p>
                        <input
                            className="form-control"
                            type="date"
                            name="EndDate"
                            value={EndDate}
                            onChange={(e) => {
                                setEndDate(e.target.value)
                            }}
                            required //done
                            max={today}
                            min={StartDate}
                        />
                        {/* <DateRange setDateHandler={setDateHandler} /> */}
                    </div>

                </>}

            </div>
            <div className="align-filters-actions">
                {ShowExcel && <ToolTip message="download">
                    <DownloadExcels excel_url={excel_url} />
                </ToolTip>}
                <ToolTip message="Search">
                    <div onClick={() => HandleSearch()} className='searchicon'>
                        <SearchIcon className='sendicon' />
                    </div>
                </ToolTip>
                <ToolTip message="Reset">
                    <div
                        className='searchicon'
                        onClick={() => reset()}
                    >
                        <CloseIcon className='closeicon' />

                    </div>
                </ToolTip>
            </div>
        </div>
    )
}

export default AdminFilters