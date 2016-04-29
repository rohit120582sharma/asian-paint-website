// global object for state manager
var stateManager;

// teture object structure
function CStateManager()
{
	this.states = [];
	
	// create and push all the states
	/*this.states.push(new CStateChroma());
	this.states.push(new CStateMasking());
	this.states.push(new CStateEraser());
	this.states.push(new CStateBrush());
	this.states.push(new CStatePerspective());*/
	
	this.currentState = new CStateMasking();			//Adding instance of Masking State to Stack
	this.states.push(this.currentState);
	
	this.currentState = new CStateEraser();				//Adding instance of StateEraser to Stack
	this.states.push(this.currentState);
	
	this.currentState = new CStateChroma();				//Adding instance of StateCroma to Stack
	this.states.push(this.currentState);
	
	this.currentState = new CStateBrush();				//Adding instance of StateBrush to Stack
	this.states.push(this.currentState);
	
	this.currentState = new CStatePerspective();		//Adding instance of StatePerspective to Stack
	this.states.push(this.currentState);
	
	this.currentState = new CStateCorrection();			//Adding instance of StateCorrection to Stack
	this.states.push(this.currentState);
}

CStateManager.prototype.destroy = function()
{
	for(var i=0; i<this.states.length; i++)
	{
		this.states[i].destroy();
	}
	this.states = null;
};

CStateManager.prototype.switchState = function(stateType)
{
	// if state is same as current one then do not change
	if(this.currentState.stateType == stateType)
		return;

	// iterate over all the states and find the new state
	for(var i=0; i<this.states.length; i++)
	{
		if(this.states[i].stateType == stateType)
		{
			var currentType = this.currentState.stateType;
			this.currentState.leaveState();
			this.currentState = this.states[i];
			this.currentState.enterState(currentType);
			break;
		}
	}
};

CStateManager.prototype.getStateInstance = function()
{
	for(var i=0; i<this.states.length; i++)
	{
		if(this.states[i].stateType == stateType)
		{
			return this.states[i];
		}
	}
	return null;
};

CStateManager.prototype.processState = function()
{
	if(this.currentState)
		this.currentState.processState();
};

CStateManager.prototype.processMessage = function(message)
{
	if(this.currentState==null)
		return false;
	
	var res = false;
	
	// whatever the message we pass it on to the current state
	res = this.currentState.processMessage(message);
	
	switch(message.type)
	{
		case messageType.SkipToChroma:
		case messageType.ProceedToChroma:
		case messageType.SwitchToChroma:
			this.switchState(EN_STATE.enChroma);
			stateCommon.pApplyChroma = $.proxy(stateManager.currentState.applyChroma, stateManager.currentState);
			break;
		case messageType.SwitchToEraser:							
			this.switchState(EN_STATE.enEraser);
			break;
		case messageType.SwitchToBrush:							
			this.switchState(EN_STATE.enBrush);
			break;
		case messageType.SwitchToPerspective:							
			this.switchState(EN_STATE.enPerspective);
			break;
		case messageType.SwitchToMasking:
			this.switchState(EN_STATE.enMasking);
			stateCommon.pMaskRender = $.proxy(stateManager.currentState.renderPreviousPolys, stateManager.currentState);
			stateCommon.pDelLastMask = $.proxy(stateManager.currentState.resetLastMask, stateManager.currentState);
			stateCommon.pUndoPolygon = $.proxy(stateManager.currentState.undoPolygon, stateManager.currentState);
			break;
		case messageType.ResetImage:
			for(var i=0; i<this.states.length; i++)
			{
				if(this.states[i] !== this.currentState)
				{
					this.states[i].processMessage(message);
				}
			}
			break;
		default:
			break;
	}
	
	return res;
};

CStateManager.prototype.renderMaskPoly = function()
{
	for(var i=0; i<this.states.length; i++)
	{
		if(this.states[i].stateType == EN_STATE.enMasking)
		{
			this.states[i].renderPreviousPolys();
			break;
		}
	}
}

CStateManager.prototype.saveLevel = function(levelToSave)
{
	for(var i=0; i<this.states.length; i++)
	{
		this.states[i].saveLevel(levelToSave, this.currentState.stateType == this.states[i].stateType);
	}
};

CStateManager.prototype.restoreLevel = function(levelToRestore)
{
	for(var i=0; i<this.states.length; i++)
	{
		this.states[i].restoreLevel(levelToRestore);
	}
};
