'use strict'

module.exports = validate

var constraints = 
{
    type: function (type, value)
    {
        if (value instanceof type ||
            (value.constructor && value.constructor === type))
        {
            return
        }
        
        return 'Expected an instance of '+type
    },
    
    min: function (min, value)
    {
        if (value < min)
        {
            return 'Must be greater than or equal to '+min
        }
    },
    
    max: function (max, value)
    {
        if (max < value)
        {
            return 'Must be less than or equal to '+max
        }
    },
    
    min_length: function (min, value)
    {
        if (value && value.length < min)
        {
            return 'Must be longer than or equal to '+min
        }
    },
    
    max_length: function (max, value)
    {
        if (value && max < value.length)
        {
            return 'Must be shorter than or equal to '+max
        }
    },
    
    matches: function (pattern, value)
    {
        if (!value.match(pattern))
        {
            return 'Must match pattern ' + pattern
        }
    },
    
    items: function (constraint_params, value)
    {
        for (var i=0; i<value.length; i++)
        {
            var error = check_constraints(constraint_params, value[i])
            
            if (error)
            {
                return error
            }
        }
    },
    
    schema: function (schema, value)
    {
        return validate(schema, value)
    }
}

function validate (schema, data)
{
    var errors = {}
    
    Object.keys(schema).forEach(function (k)
    {
        var error = check_constraints(schema[k], data[k])
        
        if (error)
        {
            errors[k] = error
        }
    })
    
    Object.keys(data).forEach(function (k)
    {
        if (!schema[k])
        {
            errors[k] = 'Unknown field'
        }
    })
    
    if (Object.keys(errors).length > 0)
    {
        return errors
    }
    
    return null
}

function check_constraints (constraint_params, value)
{
    Object.keys(constraint_params).forEach(function (k)
    {
        if (k == 'required')
        {
            return true
        }
        
        if (!constraints[k])
        {
            throw new Error('Unknown constraint "'+k+'"')
        }
    })
    
    if (value === null || value === undefined)
    {
        if (constraint_params.required)
        {
            return 'This field is required'
        }
        else
        {
            return
        }
    }
    
    var error = null
    
    Object.keys(constraints).every(function (k)
    {
        if (k == 'required')
        {
            return true
        }
        
        var constraint = constraints[k],
            params = constraint_params[k]
        
        if (!params)
        {
            return true
        }
        
        error = constraint(params, value)
        
        if (error)
        {
            return false
        }
        else
        {
            return true
        }
    })
    
    return error
}

validate.constraints = constraints