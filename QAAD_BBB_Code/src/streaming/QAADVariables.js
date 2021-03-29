/* New Variables Decared for SARA Algorithm*/

/*Variable that has to be changes with change in DATASET*/
var segment_Duration = 10;		/*This is the 'T' value in KM Algo. Change this value accoring to the segment duration dataset you are using.*/

var total_Number_of_Segments = 47;	/*Change the value, if the video length changes*/


/*PRIME VARIABLES FOR QAAD ALGO... and their values*/
var r_Max = 0;		//Value of highest Rep.
var r_Min = 0;		//Value of lowest Rep (always ZERO)
var l_next = 0;	//This is the bitrate for the next segment
var l_prev = 0;	//This is the bitrate selected for the last segment
var l_best = 0

var marginal_Buffer_Length = 10;
var minimal_Buffer_Length = 3;








var r_Current_No = 0;	//
var buffer_Current = 0;		/*Variable To observe the Current Buffer Length.*/
var rate_prev_bitrate = 0;
var segment_Limit_Flag = 0;
var starttime = 0;
var starttime_flag = 0;
var console_Print_Time = 0;
var console_Print_Counter = 0;

/***************************************/
/*One time initilatization variables for Metric Trace and other jobs*/
var lastSegmentFetchedIndex=-1;
var segmentVsQuality=[];

var segmentVsAvgThroughput=[];

var RED_log = [];

var current_Segment_Being_Downloaded = 0;

var number_Of_BSE = 0;



var available_bitrates=[];	/* This array contains the available set of bitrates */









//By default it is set to zero. Once it is set to one, that means, we are downloading the Init segments. This flag will allow to make thing smoothly in Fetching.

var IsItInitSegmentFlag=0; 
var myflag=0; //for temp use
var ctflag=0;
var v=0;
var mtflag=0;
var ct=0;
var nbs=0;
var hs=0;
var rmflag=0;
var vid=0;
var mf=0;
var bitrateflag=0;
var time=0;
var rbflag=0;
var rbe=0;

var sdflag=0;
var ctflag=0;
var vrepflag=0;

var n=1;
var rcurr=0;
var rcurr1=0;

var next=0;
var vrmin=0;
var vrmax;
var delay=0;
var wsum=0;
var wbdsum=0;
var wbd=0;
var sflag=0;
var sflagloop=0;
var mimeflag=0;



/*Declaration of Necessary Araays for SARA*/
var vrep=[]
var w=[];











