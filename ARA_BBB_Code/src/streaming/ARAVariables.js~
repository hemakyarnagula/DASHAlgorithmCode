/* New Variables Decared for SARA Algorithm*/

/*Variable that has to be changes with change in DATASET*/
var segment_Duration = 10;		/*This is the 'T' value in KM Algo. Change this value accoring to the segment duration dataset you are using.*/

var total_Number_of_Segments = 47;	/*Change the value, if the video length changes*/


/*PRIME VARIABLES FOR KM ALGO... and their values*/
var B_delay = 0;	//B_delay initially set to ZERO.. later will be decided accordingly
var r_Max = 0;		//Value of highest Rep.
var r_Min = 0;		//Value of lowest Rep (always ZERO)
var r_Current_No = 0;	//
var rate_next = 0;	//This is the bitrate for the next segment
var rate_prev = 0;	//This is the bitrate selected for the last segment
var buffer_Current = 0;		/*Variable To observe the Current Buffer Length.*/
var rate_prev_bitrate = 0;

// The Buffer Threshold's were set according to the ARA Paper (Page 2 and 4last part)
//These values has to be changes as, the segment duration changes... ( They are for 10 sec segments)
var B_min = 20;		
var B_low = 60;
var B_high = 80;
var B_opt = 70;		// this is set bcz of "0.5*(B_low + B_high)"

/*Safty Margines for ARA Algo - Set according to the paper evaluation Section - Alwayd stays between [0,1].*/
var alpha_1 = 0.3;
var alpha_2 = 0.5;
var alpha_3 = 0.7;
var alpha_4 = 0.9;


/*Variables for Buffer Check point - KM Algo*/
var B_min_t1 = 0;
var B_min_t2 = 0;
var buffer_Check_Point = 1;



var runningFastStart = true;
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











