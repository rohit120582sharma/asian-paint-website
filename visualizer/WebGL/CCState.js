// State Base class
function CCState(enState)
{
	this.stateType = enState;		// the state of this class
	
	// this is the common data
	this.commonData = new CCStateCommon();
}

CCState.prototype.processState = function()
{};

CCState.prototype.enterState = function(enPrevState)
{};

CCState.prototype.leaveState = function()
{};

CCState.prototype.processMessage = function(message)
{};

CCState.prototype.saveLevel = function(tmpStateValue, isCurrentState)
{};

CCState.prototype.restoreLevel = function(tmpStateValue)
{};